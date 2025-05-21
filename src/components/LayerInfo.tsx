const LayerInfo = ({ feature }) => {
  if (!feature) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-rose-500 overflow-scroll">
        No selection
      </div>
    );
  }
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-rose-500 overflow-scroll">
      <h2 className="text-xl font-bold mb-2">{feature.type}</h2>
      <pre className="bg-transparent text-black rounded p-2">
        {JSON.stringify(feature.properties, null, 2)}
      </pre>
    </div>
  );
};

export default LayerInfo;
