import React from "react";

const HomeWindow = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="h-3/4 w-3/4 p-2 bg-gray-700 rounded-lg shadow-xl overflow-y-scroll">
        <h1 className="text-mexican-red-700 text-4xl">TODOS:</h1>
        <ul className="list-disc ml-8">
          <li>error handling for axios errors</li>
          <li>set appropriate axios retries</li>
          <li>flash message system</li>
          {/* <li>user delete self</li> */}
          {/* <li>user leave group</li> */}
          {/* <li>group invite link/code</li> */}
          {/* <li>group delete</li> */}
          {/* <li>channel delete</li> */}
          <li>add animation for component mount and unmount</li>
          <li>messages and websockets</li>
          <li>tasks</li>
          <li>
            Check that api is not sending dangerous/unnecessary info like user
            hashed pw
          </li>
          <li>special character ban and injection checks</li>
          <li>double check privileges and auth for crud</li>
          <li>check if is admin for special crud</li>
          {/* <li>move isAuthenticated to middleware</li> */}
          <li>use mongoose lean wherever possible</li>
          {/* <li>set group dropdown to close on group change</li> */}
          <li>
            use partial fetches and updates when possible like in delete channel
          </li>
          <li>
            more useful replies from api, send data that can be used to reroute
            etc
          </li>
          <li>
            refactor to reduce processing, wherever possible pass on the
            iterated object's full data instead of parts, for example, instead
            of passing name, and id to props, pass the whole channel data so
            that the component dows not need to search for context as to what
            its state or location in groupData is ex, channelsBar passing whole
            channel data to channel badge, now the channel badge can update the
            whole channel object directly instead of first searching for itself
            in groupData
          </li>
          <li>
            check all user input, validate every input clientSide and on backend
          </li>
          <li>check that only admins can crud modify and channels</li>
          <li>serve react client from the same domain as react</li>
        </ul>
      </div>
    </div>
  );
};

export default HomeWindow;
