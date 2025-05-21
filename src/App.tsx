import { useState } from "react";
import LayerInfo from "./components/LayerInfo";
import Map from "./components/Map";

const App = () => {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <div className="flex flex-col h-screen w-screen lg:flex-row">
      <div className="lg:w-1/2 w-full h-full">
        <div className="w-full h-full">
          <Map onSelectFeature={setSelectedFeature} />
        </div>
      </div>
      <div className="lg:w-1/2 w-full h-full">
        <LayerInfo feature={selectedFeature} />
      </div>
    </div>
  );
};

export default App;
