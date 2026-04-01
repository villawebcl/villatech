interface SpecsTableProps {
  specs: Record<string, string | number>
}

export function SpecsTable({ specs }: SpecsTableProps) {
  const entries = Object.entries(specs).filter(([, v]) => v !== '' && v !== null)
  if (entries.length === 0) return null

  return (
    <div className="overflow-hidden border border-[#222222] rounded-[2px]">
      <table className="w-full text-sm">
        <tbody>
          {entries.map(([key, value], i) => (
            <tr
              key={key}
              className={`border-b border-[#222222] last:border-0 ${
                i % 2 === 0 ? 'bg-[#111111]' : 'bg-[#0A0A0A]'
              }`}
            >
              <td className="px-4 py-2.5 font-display text-[11px] uppercase tracking-widest text-[#888888] w-1/3 whitespace-nowrap">
                {key}
              </td>
              <td className="px-4 py-2.5 font-body text-[#FAFAFA] text-sm">
                {String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
