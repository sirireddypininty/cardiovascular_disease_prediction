"""
preprocessing.py
================
ECG Image Preprocessing & Quality Verification Module for DeepECG Classification.

Provides a unified, reproducible preprocessing pipeline used identically for:
- Training
- Validation
- Testing
- Prediction / Inference

Pipeline Steps:
1. ECG Image Quality Check (Resolution, Integrity, Contrast, Blank Detection)
2. Load & Convert to RGB
3. Top Header Region Cropping (15% height removal for demographic text)
4. Waveform Enhancement (Sharpening & Contrast Adjustment)
5. Resize to Target Input Resolution (224x224)
6. Convert to Float32 Array

THREE APPROVED CLASSES ONLY:
  CLASS 0 = Normal Person
  CLASS 1 = abnormal heartbeat
  CLASS 2 = Myocardial Infarction
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np

APP_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = APP_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Default Target Input Size for EfficientNet-B0
IMG_SIZE = (224, 224)
DEFAULT_HEADER_CROP_RATIO = 0.15  # Removes top 15% patient/text header region

# Approved class names (3 classes only)
CLASS_NAMES = [
    "Normal Person",
    "abnormal heartbeat",
    "Myocardial Infarction"
]

# Folders excluded from preprocessing sample generation
EXCLUDED_FOLDERS = ["history of myocardial infarction"]


def check_ecg_image_quality(image_input, min_dim=100, min_std=5.0):
    """
    ECG Image Quality Checker.
    Identifies unusable, unreadable, blank, or low-quality ECG report images
    before training or prediction.
    """
    try:
        if isinstance(image_input, (str, Path)):
            path = Path(image_input)
            if not path.exists():
                return False, "POOR QUALITY", (
                    f"POOR QUALITY: Image file does not exist at '{path}'. "
                    "Please upload a valid ECG image file."
                )

            # Verify image integrity
            with Image.open(path) as img:
                img.verify()
            img = Image.open(path).convert("RGB")
        elif isinstance(image_input, Image.Image):
            img = image_input.convert("RGB")
        else:
            return False, "POOR QUALITY", (
                f"POOR QUALITY: Unsupported input type '{type(image_input)}'. "
                "Please upload a valid image."
            )

        w, h = img.size

        # 1. Resolution Check
        if w < min_dim or h < min_dim:
            return False, "POOR QUALITY", (
                f"POOR QUALITY: Image resolution ({w}x{h}) is too low "
                f"(minimum required: {min_dim}x{min_dim}). "
                "Please upload a clearer ECG image."
            )

        # 2. Convert to grayscale array for contrast and blank detection
        gray = img.convert("L")
        gray_arr = np.array(gray, dtype=np.float32)

        # 3. Blank / Uniformity Check
        pixel_range = gray_arr.max() - gray_arr.min()
        std_dev = gray_arr.std()

        if pixel_range < 5.0 or std_dev < 1.0:
            return False, "POOR QUALITY", (
                "POOR QUALITY: Image appears blank or uniform. "
                "Please upload a clearer ECG image containing valid waveform content."
            )

        # 4. Contrast Check
        if std_dev < min_std:
            return False, "POOR QUALITY", (
                f"POOR QUALITY: Low image contrast detected (StdDev: {std_dev:.1f}). "
                "Please upload a clearer ECG image."
            )

        return True, "GOOD QUALITY", (
            "GOOD QUALITY: Image passed resolution, contrast, and integrity checks."
        )

    except Exception as e:
        return False, "POOR QUALITY", (
            f"POOR QUALITY: Image file is corrupted or unreadable ({str(e)}). "
            "Please upload a clearer ECG image."
        )


def validate_image(image_input):
    """
    Validates if an image input is readable and non-corrupted.
    """
    is_good, status, msg = check_ecg_image_quality(image_input)
    if not is_good:
        raise ValueError(msg)

    if isinstance(image_input, (str, Path)):
        return Image.open(image_input)
    elif isinstance(image_input, Image.Image):
        return image_input
    else:
        raise TypeError(f"Unsupported image input type: {type(image_input)}")


def preprocess_ecg_image(image_input, target_size=IMG_SIZE, crop_header=True,
                          header_crop_ratio=DEFAULT_HEADER_CROP_RATIO):
    """
    Executes the complete ECG image preprocessing pipeline.
    """
    # 1. Quality Check & Validation
    img = validate_image(image_input)

    # 2. Convert to RGB
    img = img.convert("RGB")
    width, height = img.size

    # 3. Crop top patient/report header region if requested
    if crop_header and header_crop_ratio > 0:
        crop_top = int(height * header_crop_ratio)
        if crop_top < height:
            img = img.crop((0, crop_top, width, height))

    # 4. Resize to target size (224 x 224)
    img = img.resize(target_size, Image.Resampling.BILINEAR)

    # 5. Mild Sharpening (Enhance ECG grid & waveform lines)
    img = img.filter(ImageFilter.SHARPEN)

    # 6. Mild Contrast Enhancement
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.1)

    # 7. Convert to Numpy Array (float32, [0, 255] range for EfficientNet)
    img_array = np.array(img, dtype=np.float32)

    return img_array


def preprocess_for_inference(image_path, target_size=IMG_SIZE):
    """
    Preprocesses a single ECG image for model inference.
    Executes quality check first.
    """
    is_good, quality_status, detail_msg = check_ecg_image_quality(image_path)
    if not is_good:
        return False, quality_status, detail_msg, None

    img_array = preprocess_ecg_image(image_path, target_size=target_size)
    batch_tensor = np.expand_dims(img_array, axis=0)
    return True, quality_status, detail_msg, batch_tensor


def generate_preprocessing_samples(dataset_dir=None, output_dir=None):
    """
    Generates before/after visual examples for the 3 approved classes
    and saves them to output_dir.
    """
    if dataset_dir is None:
        dataset_dir = PROJECT_ROOT / "data" / "original_dataset"
    if output_dir is None:
        output_dir = PROJECT_ROOT / "outputs" / "preprocessing"

    dataset_path = Path(dataset_dir)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    summary_lines = []
    summary_lines.append("ECG Image Preprocessing Audit & Summary")
    summary_lines.append("=" * 50)
    summary_lines.append(f"Header Crop Ratio      : {DEFAULT_HEADER_CROP_RATIO * 100:.1f}% top height removed")
    summary_lines.append(f"Target Input Resolution: {IMG_SIZE[0]}x{IMG_SIZE[1]} RGB")
    summary_lines.append("Enhancements Applied   : Sharpening (Waveform Definition) + Contrast (1.1x)")
    summary_lines.append("\nSample Comparison Outputs:")

    for class_folder in sorted(dataset_path.iterdir()):
        if not class_folder.is_dir():
            continue

        if class_folder.name.lower().strip() in EXCLUDED_FOLDERS:
            summary_lines.append(f"  - Class '{class_folder.name}': EXCLUDED from pipeline")
            continue

        class_name = class_folder.name
        image_files = (
            list(class_folder.glob("*.jpg")) +
            list(class_folder.glob("*.png")) +
            list(class_folder.glob("*.jpeg"))
        )
        if not image_files:
            continue
        sample_file = image_files[0]

        try:
            orig_img = Image.open(sample_file).convert("RGB")
            orig_resized = orig_img.resize(IMG_SIZE, Image.Resampling.BILINEAR)

            processed_arr = preprocess_ecg_image(sample_file, target_size=IMG_SIZE)
            processed_img = Image.fromarray(processed_arr.astype(np.uint8))

            combined = Image.new("RGB", (IMG_SIZE[0] * 2 + 10, IMG_SIZE[1]), (255, 255, 255))
            combined.paste(orig_resized, (0, 0))
            combined.paste(processed_img, (IMG_SIZE[0] + 10, 0))

            clean_class_name = class_name.replace(" ", "_")
            out_filename = output_path / f"before_after_{clean_class_name}.png"
            combined.save(out_filename)
            summary_lines.append(f"  - Class '{class_name}': {out_filename.name}")
        except Exception as e:
            summary_lines.append(f"  - Class '{class_name}': ERROR - {str(e)}")

    summary_txt_path = output_path / "preprocessing_summary.txt"
    with open(summary_txt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(summary_lines))

    return str(summary_txt_path)


if __name__ == "__main__":
    print("Testing Preprocessing & Image Quality Checker Module...")
    summary_file = generate_preprocessing_samples()
    print(f"Preprocessing audit complete. Summary saved to: {summary_file}")