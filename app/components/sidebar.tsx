export default function Sidebar() {
  return (
    <>
      <aside className="flex flex-row h-screen bg-green-500 w-60 rounded-r-2xl">
        <div className=" space-x-2">
          <button className="bg-blue-400 rounded-2xl w-16">playlist</button>
          <button className="bg-blue-400 rounded-2xl w-16">artist</button>
          <button className="bg-blue-400 rounded-2xl w-16">albums</button>
        </div>
      </aside>
    </>
  );
}
