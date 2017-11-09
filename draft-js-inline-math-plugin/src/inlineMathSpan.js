
const inlineMathSpan = (props) => {
  return (
    <span style={{color: "red", padding: "3px"}} onChange={() => console.log("changed inline math span")}>
      {props.children}
    </span>
  )
}

export default inlineMathSpan;
