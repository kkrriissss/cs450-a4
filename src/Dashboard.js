import React from "react";
import FileUpload from "./FileUpload";
import TweetVisualization from "./TweetVisualization";

function Dashboard({ data, setData }) {
  return (
    <div>
      <FileUpload set_data={setData} />
      {data ? (
        <div>
          <h3 style={{ textAlign: "center" }}>Data Loaded Successfully!</h3>
          <TweetVisualization data={data} />
        </div>
      ) : (
        <p style={{ textAlign: "center", marginTop: 20 }}>
          Start with json.
        </p>
      )}
    </div>
  );
}

export default Dashboard;
