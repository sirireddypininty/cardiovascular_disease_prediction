import os
import hashlib
import re
from pathlib import Path
from collections import defaultdict
from PIL import Image

def _md5(file_path, chunk_size=8192):
    """Compute MD5 hash of a file."""
    hash_md5 = hashlib.md5()
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(chunk_size), b''):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def classify_folder(folder_name):
    """Return class label for a folder, or None if excluded."""
    key = folder_name.lower().strip()
    if 'history' in key or 'pmi' in key:
        return None
    if 'abnormal' in key or 'hb' in key:
        return 'abnormal heartbeat'
    if 'normal' in key or 'np' in key:
        return 'Normal Person'
    if 'myocardial' in key or 'mi' in key:
        return 'Myocardial Infarction'
    return None

def audit_dataset(dataset_dir: Path, output_dir: Path):
    """Audit the ECG dataset using patient-level grouping."""
    info = {
        'total_images': 0,
        'class_counts': defaultdict(int),
        'patient_images': defaultdict(list),
        'md5_to_files': defaultdict(list),
        'image_details': {},
    }

    for split in ['Train', 'Test']:
        split_path = dataset_dir / split
        if not split_path.is_dir():
            continue
        for class_dir in split_path.iterdir():
            if not class_dir.is_dir():
                continue
            class_name = classify_folder(class_dir.name)
            if class_name is None:
                continue

            for img_path in class_dir.iterdir():
                if not img_path.is_file():
                    continue
                if img_path.suffix.lower() not in {'.jpg', '.jpeg', '.png', '.bmp'}:
                    continue
                
                info['total_images'] += 1
                info['class_counts'][class_name] += 1

                stem = img_path.stem
                m = re.search(r"\((\d+)\)", stem)
                if m:
                    patient_id = f"{class_name}_{m.group(1)}"
                else:
                    patient_id = f"{class_name}_{stem}"
                    
                info['patient_images'][patient_id].append(str(img_path))

                file_md5 = _md5(img_path)
                info['md5_to_files'][file_md5].append(str(img_path))

                if patient_id not in info['image_details']:
                    try:
                        with Image.open(img_path) as im:
                            info['image_details'][patient_id] = {
                                'format': im.format,
                                'size': im.size,
                            }
                    except Exception:
                        info['image_details'][patient_id] = {'format': 'unknown', 'size': None}

    duplicate_groups = {h: files for h, files in info['md5_to_files'].items() if len(files) > 1}
    duplicate_group_count = len(duplicate_groups)
    duplicate_file_count = sum(len(files) - 1 for files in duplicate_groups.values())
    unique_counts = info['total_images'] - duplicate_file_count

    report_lines = []
    report_lines.append('=== Dataset Audit Report ===')
    report_lines.append(f'Total valid images (Train + Test): {info["total_images"]}')
    report_lines.append('')
    report_lines.append('Class distribution (3 approved classes):')
    for cls, cnt in info['class_counts'].items():
        report_lines.append(f'  {cls}: {cnt}')
    report_lines.append('')
    report_lines.append(f'Unique patient records: {len(info["patient_images"])}')
    report_lines.append('')
    report_lines.append(f'Exact duplicate image groups (by MD5): {duplicate_group_count}')
    report_lines.append('')
    
    output_path = output_dir / 'new_dataset_audit.txt'
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report_lines))
    print(f'Audit report written to {output_path}')

    return unique_counts, info['total_images'], duplicate_group_count, info['total_images']

if __name__ == '__main__':
    base_dir = Path(r'dataset')
    output_dir = Path(r'outputs')
    audit_dataset(base_dir, output_dir)
