import React from "react";

const TodoDetails = ({ data }) => {
  const todos = [
    { id: "1", name: "todo 1", completed: false },
    { id: "2", name: "todo SJDAOISJDOIJ", completed: false },
    { id: "3", name: "todo 3", completed: true },
  ];

  const todo = todos.find((t) => t.id === data.id);

  React.useEffect(() => {
    console.log(data);
  }, []);

  return (
    <>
      <div className="todo-details">
        <p>{todo.name}</p>
      </div>
    </>
  );
};

export default TodoDetails;
