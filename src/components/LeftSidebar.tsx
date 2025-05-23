export default function LeftSidebar({ selected, onChange }) {
  const options = [
    { value: "question_01", label: "Question 01" },
    { value: "question_02", label: "Question 02" },
  ];

  return (
    <div className="p-4">
      <h2 className="font-bold mb-2 text-blue-800">Select Question</h2>
      <ul className="space-y-2">
        {options.map((opt) => (
          <li
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`cursor-pointer px-3 py-2 rounded text-blue-800 border border-blue-700 shadow-2xl ${
              selected === opt.value
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-300"
            }`}
          >
            {opt.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
