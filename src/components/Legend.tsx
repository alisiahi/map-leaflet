const Legend = ({
  min,
  max,
  colorFunc,
  label = "AGS",
}: {
  min: number;
  max: number;
  colorFunc: (ags: string, min: number, max: number) => string;
  label?: string;
}) => {
  const steps = 6;
  const values = Array.from({ length: steps }, (_, i) =>
    Math.round(min + ((max - min) * i) / (steps - 1))
  );
  return (
    <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 rounded shadow p-2 text-xs z-[1000]">
      <div className="font-bold mb-1">{label} Color Scale</div>
      <div className="flex items-center space-x-1">
        {values.map((v, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              style={{
                width: 24,
                height: 16,
                background: colorFunc(v.toString(), min, max),
                border: "1px solid #ccc",
              }}
            />
            <span className="text-[10px]">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
