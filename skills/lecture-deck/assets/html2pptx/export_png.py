"""PowerPoint COM 으로 PPTX 를 슬라이드별 PNG 로 내보낸다 (대조 검증용)."""

import gc
import sys
import time
from pathlib import Path

import win32com.client as win32


def export(pptx: Path, out_dir: Path, width=1280, height=720, attempts=3):
    """PowerPoint 는 이전 인스턴스가 남아 있으면 첫 Export 를 OLE 오류로 거부할
    때가 있다. 몇 번 다시 시도하면 붙는다."""
    last = None
    for _ in range(attempts):
        try:
            return _export_once(pptx, out_dir, width, height)
        except Exception as exc:  # noqa: BLE001
            last = exc
            time.sleep(2)
    raise last


def _export_once(pptx: Path, out_dir: Path, width, height):
    out_dir.mkdir(parents=True, exist_ok=True)
    # 동적 디스패치는 명명 인자를 못 묶는 경우가 있어 위치 인자로 넘긴다
    # Open(FileName, ReadOnly, Untitled, WithWindow)
    app = win32.gencache.EnsureDispatch("PowerPoint.Application")
    pres = app.Presentations.Open(str(pptx.resolve()), True, False, False)
    try:
        pres.Export(str(out_dir.resolve()), "PNG", width, height)
    finally:
        try:
            pres.Close()
        except Exception:
            pass
        del pres
        gc.collect()
        # 남은 프레젠테이션이 없을 때만 종료한다 (있으면 Quit 이 거부된다)
        try:
            if app.Presentations.Count == 0:
                app.Quit()
        except Exception:
            pass
        del app
        gc.collect()
    return sorted(p for p in out_dir.iterdir() if p.suffix.lower() == ".png")


if __name__ == "__main__":
    files = export(Path(sys.argv[1]), Path(sys.argv[2]))
    print(f"exported {len(files)} images -> {sys.argv[2]}")
