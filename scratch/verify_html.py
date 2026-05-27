import html.parser

class HTMLTagChecker(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []

    def handle_starttag(self, tag, attrs):
        if tag not in ["img", "input", "br", "hr", "meta", "link"]:
            self.stack.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        if tag not in ["img", "input", "br", "hr", "meta", "link"]:
            if not self.stack:
                print(f"Error: Closing tag </{tag}> at {self.getpos()} has no matching open tag.")
                return
            open_tag, pos = self.stack.pop()
            if open_tag != tag:
                print(f"Error: Mismatched tags! Open <{open_tag}> at {pos} closed by </{tag}> at {self.getpos()}.")

    def check(self, file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            self.feed(f.read())
        if self.stack:
            print("Unclosed tags remaining in stack:")
            for tag, pos in reversed(self.stack):
                print(f"  <{tag}> opened at {pos}")
        else:
            print("All tags are correctly balanced!")

checker = HTMLTagChecker()
checker.check("../frontend/pages/admin-dashboard.html")
