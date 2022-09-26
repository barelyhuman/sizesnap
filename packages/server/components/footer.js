import Link from "next/link";
import Box from "./box";
import Text from "./text";

export default function Footer() {
  return (
    <>
      <footer>
        <Box marginT-100 className="flex center">
          <Text margin-8>
            <Link href="/">
              <a className="lowercase">sizesnap</a>
            </Link>
          </Text>
          <Text margin-8>
            <Link href="https://github.com/barelyhuman/sizesnap">
              <a className="lowercase">github</a>
            </Link>
          </Text>
          <Text margin-8>
            <Link href="mailto:ahoy@barelyhuman.dev">
              <a className="lowercase">contact</a>
            </Link>
          </Text>
        </Box>
        <Text margin-0 className="text-dim lowercase" align="center">
          made for fun by <a href="https://reaper.is">reaper.is</a>
        </Text>
      </footer>
    </>
  );
}
