import Box from "./box";

export default function Text({ elm = "p", children, ...props }) {
  return (
    <>
      <Box elm={elm} {...props}>
        {children}
      </Box>
    </>
  );
}
