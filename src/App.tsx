import LeftSidebar from "./components/LeftSidebar";
import MapView from "./components/MapView";
import RightSidebar from "./components/RightSidebar";

import { useState } from "react";

const App = () => {
  const [colorVariable, setColorVariable] = useState("question_01");

  return (
    <div className="grid grid-cols-5 h-screen w-screen">
      <div className="col-span-1 bg-blue-100">
        <LeftSidebar selected={colorVariable} onChange={setColorVariable} />
      </div>
      <div className="col-span-2">
        <MapView colorVariable={colorVariable} />
      </div>
      <div className="col-span-2 bg-blue-100">
        <RightSidebar colorVariable={colorVariable} />
      </div>
    </div>
  );
};

export default App;
