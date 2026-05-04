import { useEffect, useState } from "react";
import { api } from "../api/api";
import useDebounce from "../hooks/useDebounce";

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search);

  const fetchData = async () => {
    const res = await api.get(`/?search=${debounced}`);
    setLeads(res.data.leads);
  };

  useEffect(() => {
    fetchData();
  }, [debounced]);

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <input
          className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-black"
          placeholder="Search leads..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Caller ID</th>
              <th className="p-3">Zip</th>
              <th className="p-3">Agent</th>
              <th className="p-3">Vendor</th>
            </tr>
          </thead>

          <tbody>
            {leads.map((l) => (
              <tr key={l._id} className="border-t hover:bg-gray-50">
                <td className="p-3">{l.callerid}</td>
                <td className="p-3">{l.ZipCode}</td>
                <td className="p-3">{l.agentname}</td>
                <td className="p-3">{l.vendor_code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}