import subprocess
import sys
from datetime import datetime


def run(cmd, **kwargs):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, **kwargs)
    if result.stdout.strip():
        print(result.stdout.strip())
    if result.stderr.strip():
        print(result.stderr.strip())
    return result


def main():
    import os
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    # Check if anything to commit
    status = run("git status --porcelain")
    if not status.stdout.strip():
        print("Nothing to commit, working tree clean.")
        return

    msg = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else f"update {datetime.now().strftime('%Y-%m-%d %H:%M')}"

    run("git add .")
    result = run(f'git commit -m "{msg}"')
    if result.returncode != 0:
        print("Commit failed.")
        sys.exit(1)

    result = run("git push origin main")
    if result.returncode != 0:
        print("Push failed.")
        sys.exit(1)

    print(f"\nPushed: {msg}")


if __name__ == "__main__":
    main()
