export function Table({ data, fields }) {
  const headers = fields.map((h) => (
    <th key={`header-${h.key}`} className="text-dim uppercase">
      {h.label}
    </th>
  ));

  const rows = data.map((item, index) => (
    <Row key={index} data={item} fields={fields} />
  ));
  return (
    <>
      <table className="w-100">
        <thead>
          <tr>{headers}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </>
  );
}

function Row({ data, fields }) {
  return (
    <tr>
      {fields.map((field, index) => (
        <td key={`data-${field.key}-${index}`}>
          {field.modifier(data[field.key])}
        </td>
      ))}
    </tr>
  );
}
