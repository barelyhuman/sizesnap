import Box from "components/box";
import Input from "components/input";
import Text from "components/text";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [pkgSearch, setPkgSearch] = useState("");
  const [formState, setFormState] = useState({
    loading: false,
  });

  const handleKeypress = (e) => {
    if (e.code !== "Enter") return;

    setFormState({
      loading: true,
    });
    router.push(`/${pkgSearch}`);
  };

  return (
    <>
      <section className="container">
        <Text elm="h1" margin-0 padding-0 className="lowercase">
          SizeSnap
        </Text>
        <Text margin-0 padding-0>
          <small className="lowercase text-dim">
            file size snapshots for js packages
          </small>
        </Text>
        <Box marginY-100>
          <Input
            marginB-12
            value={pkgSearch}
            placeholder="Package name? (eg: sizesnap@0.0.1)"
            onChange={(e) => setPkgSearch(e.target.value)}
            onKeyUp={handleKeypress}
          />
          <div className="flex center">
            {formState.loading ? <div className="dot-pulse"></div> : null}
          </div>
        </Box>
        <Text elm="h2">About</Text>
        <Text marginT-12>
          <strong>sizesnap</strong> is a fun project built by{" "}
          <a href="https://github.com/barelyhuman">Reaper</a> to monitor files
          sizes and primarily comes as a module to be used with web libraries to
          check on the deliverable files sizes of their packages.
        </Text>
        <Text marginT-12>
          If {"you'd"} like <strong>granular control</strong> of what files are
          sized, do checkout the npm package and use instead.
          <pre className="code">
            <code>
              {`npm i sizesnap
# or 
yarn add sizesnap`}
            </code>
          </pre>
        </Text>
        <Text>
          The web version is for a quick check on acwhat installing a package
          would bring with it, much like bundlephobia but will a few more
          details on the contents of the package
        </Text>

        <Text elm="h2" marginT-100>
          Caveats
        </Text>
        <Text>
          Due to the nature of the implementation, {"it's"} hard to do all the
          heavy lifting on <a href="https://vercel.com">Vercel</a> so{" "}
          {"there's"} a <strong>size limit</strong> after which the web version
          might not work
        </Text>

        <Text elm="h2" marginT-100>
          Sponsors
        </Text>
        <Text>
          No sponsors yet. If you do like the project and would like to help
          out, consider sponsoring the project by visiting
          <a href="https://github.com/barelyhuman/sponsors"> the donate page</a>
        </Text>
      </section>
    </>
  );
}
