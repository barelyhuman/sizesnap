import Box from "components/box";
import { Table } from "components/table";
import Text from "components/text";
import Link from "next/link";
import { Router, useRouter } from "next/router";
import { useEffect, useState } from "react";
import { pretty, parse } from "../../../lib/bytes";
import { generateSnapshot, getPackageData } from "../../../lib/packages";

const MAX_SIZE = "4MB";
const isValidSize = (size) => parse(size) < parse(MAX_SIZE);

const fields = [
  {
    key: "file",
    label: "file",
    modifier: (v) => v.replace("./", ""),
  },
  {
    key: "size",
    label: "size",
    modifier: (v) =>
      isValidSize(v) ? v : <span className="text-error">{v}</span>,
  },
  {
    key: "gzip",
    label: "gzip",
    modifier: (v) =>
      isValidSize(v) ? v : <span className="text-error">{v}</span>,
  },
  {
    key: "brotli",
    label: "brotli",
    modifier: (v) =>
      isValidSize(v) ? v : <span className="text-error">{v}</span>,
  },
];

export default function PackagePage({ pkgData, archiveFiles }) {
  const route = useRouter();

  const [loading, setLoading] = useState(false);

  const showFileSizes = archiveFiles && archiveFiles.length > 0;
  const normalizedPath = route.asPath.replace(/\?force=true/g, "");

  useEffect(() => {
    Router.events.on("routeChangeComplete", () => setLoading(false));
    Router.events.on("routeChangeStart", () => setLoading(true));
  }, []);

  if (!pkgData) {
    return (
      <Box paddingY-100>
        <Text elm="h1" className="flex center text-error">
          {"Oops! Failed to size the given package"}
        </Text>
      </Box>
    );
  }

  return (
    <>
      <Box className="flex align-baseline justify-between">
        <Box className="flex align-baseline">
          <Text elm="h2">{pkgData.pkg}</Text>
          <Text elm="p" marginL-8>
            <small className="text-dim">{pkgData.version}</small>{" "}
          </Text>
        </Box>
        <Box>
          <Text margin-0 padding-0 className="strong" align="right">
            <small>
              <small className="text-dim uppercase">unpacked size:</small>{" "}
            </small>
            <span
              className={
                !isValidSize(pkgData.size) ? "text-error" : "text-success"
              }
            >
              {pretty(pkgData.size)}{" "}
            </span>
          </Text>
          <Text margin-0 padding-0 align="right">
            <small className="text-error">
              {!isValidSize(pkgData.size)
                ? "(might not be able to size package)"
                : ""}
            </small>
          </Text>
        </Box>
      </Box>

      {!showFileSizes ? (
        <>
          <Box padding-12 className="flex center">
            {loading ? (
              <Box marginT-50 className="dot-pulse"></Box>
            ) : (
              <Link
                href={`${normalizedPath}?force=true`}
                replace={true}
                shallow={false}
              >
                <a className="cta text-base">Try Generating Snapshot anyway?</a>
              </Link>
            )}
          </Box>
        </>
      ) : (
        <>
          <Box marginT-100 className="flex center">
            <Table data={archiveFiles} fields={fields} />
          </Box>
        </>
      )}
    </>
  );
}

export const getServerSideProps = async ({ query }) => {
  const result = {
    props: {},
  };
  const pkgData = await getPackageData(query.package.join("/"));

  result.props.pkgData = pkgData;

  if (!isValidSize(pkgData.size) && !Boolean(query.force)) {
    return result;
  }

  result.props.archiveFiles = await generateSnapshot(pkgData);

  return result;
};
