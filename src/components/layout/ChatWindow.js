import { useParams } from "react-router-dom";

function ChatWindow() {
  const { channel } = useParams();

  return (
    <div className="bg-slate-600 h-screen w-3/4 flex-grow flex flex-col justify-between items-center relative">
      <div>in {channel}</div>
      <div className="w-full p-4 overflow-y-scroll scrollbar-dark">
        <div>message</div>
        <div>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Error velit
          ea nihil ex maxime recusandae optio aspernatur hic explicabo eos!
          Accusantium explicabo impedit pariatur beatae numquam, nobis fugit ab
          exercitationem.
        </div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>
          special prop children always contains everything passed to it in
          between the component's opening and closing tags
        </div>
        <div>message</div>

        <div className="flex mt-2 mb-2">
          <img
            src="https://picsum.photos/100/100?random=4"
            alt="profile"
            className=" w-1/12 mr-2 rounded-full"
          />
          <span className="flex flex-col">
            <div className="text-mexican-red-700 font-kanit">Big Mackie</div>
            <div>
              <div>Yo me hungy</div>
            </div>
          </span>
        </div>

        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div>message</div>
        <div className="w-full h-20"></div>
      </div>
      <div className="w-full h-1/6 backdrop-blur-sm bottom-0 absolute blurMask"></div>
      <div className="w-4/5 m-4 p-2 bg-slate-500 rounded-lg flex justify-around shadow-lg absolute bottom-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#222222"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
          />
        </svg>{" "}
        <input
          type="text"
          className="bg-inherit focus:outline-none flex-grow font-nunito"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-1 ml-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#222222"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#222222"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
      </div>
    </div>
  );
}

export default ChatWindow;
