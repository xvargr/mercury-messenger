import { useState, createContext } from "react";

export const DataContext = createContext(); // use this to access the values here

// use this to wrap around components that needs to access the values here
export function DataStateProvider(props) {
  const [groupMounted, setGroupMounted] = useState(false);
  const [groupData, setGroupData] = useState({
    name: "",
    image: { url: "", filename: "", thumbnail: "" },
    channels: [],
  });
  const dataState = { groupData, setGroupData, groupMounted, setGroupMounted };

  return (
    <DataContext.Provider value={dataState}>
      {props.children}
    </DataContext.Provider>
  );
}
