from pathlib import Path


def read_secret(path: Path, default: str = "") -> str:
    try:
        with open(path, "r") as file:
            return file.read().strip()
    except FileNotFoundError:
        return default
