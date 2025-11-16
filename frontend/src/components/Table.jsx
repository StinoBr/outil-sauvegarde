import StatusBadge from './StatusBadge';
import { formatDateTime } from '../lib/utils';

export default function Table({ rows, columns }) {
  return (
    <div className="overflow-auto scrollbar">
      <table className="table table-striped">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.accessor}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => {
                const value = row[column.accessor];
                if (column.accessor === 'status') {
                  return (
                    <td key={column.accessor}>
                      <StatusBadge status={value} />
                    </td>
                  );
                }
                if (column.accessor === 'createdAt') {
                  return <td key={column.accessor}>{formatDateTime(value)}</td>;
                }
                return <td key={column.accessor}>{value}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
