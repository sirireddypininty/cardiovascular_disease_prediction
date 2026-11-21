import os
import sys
import hashlib
import re
import time
import numpy as np
from pathlib import Path
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

from Preprocessing import preprocess_ecg_image, IMG_SIZE

DATASET_DIR = Path("dataset")
OUTPUT_DIR = Path("outputs")
SEED = 42

NUM_CLASSES = 3
CLASS_NAMES = [
    "Normal Person",
    "abnormal heartbeat",
    "Myocardial Infarction"
]
CLASS_TO_IDX = {cname: idx for idx, cname in enumerate(CLASS_NAMES)}
_EXCLUDE_SUBSTRINGS = ["history of myocardial", "history of mi", "pmi"]

def _classify_folder(folder_name: str):
    key = folder_name.lower().strip()
    for excl in _EXCLUDE_SUBSTRINGS:
        if excl in key:
            return None
    if "abnormal" in key or "hb" in key:
        return "abnormal heartbeat"
    if "normal" in key or "np" in key:
        return "Normal Person"
    if "myocardial" in key or "mi" in key:
        return "Myocardial Infarction"
    return None

def file_md5(filepath):
    hasher = hashlib.md5()
    with open(filepath, "rb") as f:
        hasher.update(f.read())
    return hasher.hexdigest()

def extract_patient_id(fpath: Path, cname: str) -> str:
    stem = fpath.stem
    m = re.search(r"\((\d+)\)", stem)
    if m:
        return f"{cname}_{m.group(1)}"
    m2 = re.search(r"\d+", stem)
    if m2:
        return f"{cname}_{m2.group(0)}"
    return f"{cname}_{stem}"

def load_and_group_dataset():
    valid_images = []
    for split in ['Train', 'Test']:
        split_dir = DATASET_DIR / split
        if not split_dir.exists():
            continue
        for class_dir in split_dir.iterdir():
            if not class_dir.is_dir():
                continue
            cname = _classify_folder(class_dir.name)
            if cname is None or cname not in CLASS_TO_IDX:
                continue
            for fpath in class_dir.glob('*'):
                if fpath.is_file() and fpath.suffix.lower() in ['.jpg', '.jpeg', '.png', '.bmp']:
                    valid_images.append((fpath, cname))

    patient_to_images = defaultdict(list)
    patient_to_class = {}
    for fpath, cname in valid_images:
        pid = extract_patient_id(fpath, cname)
        patient_to_images[pid].append(fpath)
        patient_to_class[pid] = cname

    patient_list = sorted(list(patient_to_images.keys()))
    patient_labels = [patient_to_class[pid] for pid in patient_list]
    y_patients = np.array([CLASS_TO_IDX[c] for c in patient_labels])

    from sklearn.model_selection import StratifiedShuffleSplit
    sss1 = StratifiedShuffleSplit(n_splits=1, test_size=0.30, random_state=SEED)
    train_idx, temp_idx = next(sss1.split(patient_list, y_patients))

    train_patients = [patient_list[i] for i in train_idx]
    temp_patients = [patient_list[i] for i in temp_idx]
    y_temp = y_patients[temp_idx]

    sss2 = StratifiedShuffleSplit(n_splits=1, test_size=0.50, random_state=SEED)
    val_idx, test_idx = next(sss2.split(temp_patients, y_temp))

    val_patients = [temp_patients[i] for i in val_idx]
    test_patients = [temp_patients[i] for i in test_idx]

    def collect_split_files(patients_subset):
        split_files, split_labels = [], []
        for pid in patients_subset:
            cname = patient_to_class[pid]
            cidx = CLASS_TO_IDX[cname]
            seen_hashes = set()
            for fpath in patient_to_images[pid]:
                fhash = file_md5(fpath)
                if fhash not in seen_hashes:
                    seen_hashes.add(fhash)
                    split_files.append(fpath)
                    split_labels.append(cidx)
        return split_files, np.array(split_labels, dtype=np.int32)

    train_files, y_train = collect_split_files(train_patients)
    val_files, y_val = collect_split_files(val_patients)
    test_files, y_test = collect_split_files(test_patients)

    return train_files, y_train, val_files, y_val, test_files, y_test

def parallel_preprocess(files, target_size=(224, 224)):
    def _worker(f):
        return preprocess_ecg_image(f, target_size=target_size)

    with ThreadPoolExecutor(max_workers=16) as executor:
        results = list(executor.map(_worker, files))
    return np.array(results, dtype=np.float32)

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    cache_path = OUTPUT_DIR / "cached_dataset_224.npz"

    print("Extracting patient-level stratified 70/15/15 splits...", flush=True)
    train_files, y_train, val_files, y_val, test_files, y_test = load_and_group_dataset()
    print(f"Files to process: Train={len(train_files)}, Val={len(val_files)}, Test={len(test_files)}", flush=True)

    t0 = time.time()
    print("Parallel preprocessing Train set...", flush=True)
    X_train = parallel_preprocess(train_files, target_size=(224, 224))
    print(f"Train done in {time.time()-t0:.2f}s", flush=True)

    t0 = time.time()
    print("Parallel preprocessing Val set...", flush=True)
    X_val = parallel_preprocess(val_files, target_size=(224, 224))
    print(f"Val done in {time.time()-t0:.2f}s", flush=True)

    t0 = time.time()
    print("Parallel preprocessing Test set...", flush=True)
    X_test = parallel_preprocess(test_files, target_size=(224, 224))
    print(f"Test done in {time.time()-t0:.2f}s", flush=True)

    print(f"Saving cached dataset to {cache_path}...", flush=True)
    np.savez_compressed(
        cache_path,
        X_train=X_train, y_train=y_train,
        X_val=X_val, y_val=y_val,
        X_test=X_test, y_test=y_test
    )
    print("Dataset successfully cached!", flush=True)

if __name__ == "__main__":
    main()
