import sys

def solve():
    # Read the two input strings
    try:
        s1 = sys.stdin.readline().strip()
        s2 = sys.stdin.readline().strip()
    except EOFError:
        return

    if not s1 or not s2:
        return

    # Convert both to lowercase for case-insensitive comparison
    s1 = s1.lower()
    s2 = s2.lower()

    # Compare lexicographically
    if s1 < s2:
        print("-1")
    elif s1 > s2:
        print("1")
    else:
        print("0")

if __name__ == "__main__":
    solve()