import os
import json
import argparse
from pathlib import Path
import re


# --- Load templates ---
with open("readiness.selenium.Windows.11.Chrome.88.spec.ts", "r") as f:
    desktop_template = f.read()

with open("readiness.selenium.Android.15.0.Galaxy.S25.Ultra.Chrome.latest.spec.ts", "r") as f:
    mobile_template = f.read()

# --- Helpers ---
def title_case(value: str) -> str:
    """Convert a string to Title Case."""
    return value.title()

def normalize_capabilities(entry: dict) -> dict:
    """Normalize fields (Title Case where possible)."""
    caps = entry.copy()
    if "os" in caps:
        caps["os"] = caps["os"].upper() if re.match(r"(?i)^ios$", caps["os"]) else title_case(caps["os"])
    elif "platform" in caps:
        caps["os"] = caps["platform"].upper() if re.match(r"(?i)^ios$", caps["platform"]) else title_case(caps["platform"])
    elif "platformName" in caps:
        caps["os"] = caps["platformName"].upper() if re.match(r"(?i)^ios$", caps["platformName"]) else title_case(caps["platformName"])
    else:
        raise ValueError("Missing 'os', 'platform' or 'platformName' in capabilities.")
    if "os_version" in caps:
        caps["os_version"] = str(caps["os_version"])
        caps["os_version_safe"] = caps["os_version"].replace(" ", ".")
    elif "osVersion" in caps:
        caps["os_version"] = str(caps["osVersion"])
        caps["os_version_safe"] = caps["os_version"].replace(" ", ".")
    else:
        raise ValueError("Missing 'os_version' in capabilities.")
    if "realMobile" in caps and caps["realMobile"] == "true":
      if "deviceName" in caps:
          deviceName = title_case(caps["deviceName"]).replace("Ipad", "iPad")
          deviceParts = deviceName.split(" ")
          caps["device"] = deviceName
          if (len(deviceParts) > 1):
              caps["device_brand"] = deviceParts[0]
              caps["device_model"] = " ".join(deviceParts[1:]).replace(" ", ".")
          else:
              caps["device_brand"] = deviceName
              caps["device_model"] = "generic"
      else:
          raise ValueError("Missing 'deviceName' in capabilities.")
    if "browser" in caps:
        caps["browser"] = caps["browser"].title()
    elif "browserName" in caps:
        caps["browser"] = title_case(caps["browserName"])
    else:
        raise ValueError("Missing 'browser' or 'browserName' in capabilities.")
    if "browser_version" in caps:
        caps["browser_version"] = str(caps["browser_version"])
        caps["browser_version_safe"] = caps["browser_version"].replace(" ", ".")
    elif "browserVersion" in caps:
        caps["browser_version"] = str(caps["browserVersion"])
        caps["browser_version_safe"] = caps["browser_version"].replace(" ", ".")
    else:
        raise ValueError("Missing 'browser_version' or 'browserVersion' in capabilities.")
    return caps

def get_path(caps: dict, base_dir="../../tests/readiness/selenium") -> Path:
    """Build the output file path from capabilities."""
    parts = [caps["os"]]
    if caps.get("os_version"):
        parts.append(caps["os_version"])
    if caps.get("device"):
        parts.extend(caps["device"].split())
    if caps.get("browser"):
        parts.append(caps["browser"])
    if caps.get("browser_version"):
        parts.append(caps["browser_version"])
    path = Path(base_dir, *[p for p in parts])
    filename = f"readiness.selenium.{'.'.join(parts)}.spec.ts"
    return path / filename

def fill_template(caps: dict) -> str:
    """Choose desktop vs mobile template and substitute placeholders."""
    template = mobile_template if caps.get("device") else desktop_template
    result = template
    # Replace placeholders
    for key, val in caps.items():
        placeholder = f"{{{{{key}}}}}"
        result = result.replace(placeholder, val)
    return result

# --- Main ---
def main(test_run=False):
    with open("../data/platforms.browsers.json", "r") as f:
        browsers = json.load(f)

    for entry in browsers:
        try:
          caps = normalize_capabilities(entry)
          path = get_path(caps)
          content = fill_template(caps)

          if test_run:
              print("="*80)
              print(f"FILE: {path}")
              print()
              print(content)
              print()
          else:
              path.parent.mkdir(parents=True, exist_ok=True)
              with open(path, "w") as f:
                  f.write(content)
        except Exception as e:
          print(f"Error processing entry {entry}: {e}")
          break

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--test-run", action="store_true", help="Dry run mode, print files instead of saving.")
    args = parser.parse_args()
    main(test_run=args.test_run)
# To run: python build/test/testGenerator.py [--test-run]