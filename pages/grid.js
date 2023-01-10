import React from "react";

const Card = (props) => {
  return (<div className="relative cursor-pointer">
    {props.children}
  </div>)
}

const Grid = ({ children }) => {
  const filteredChildren = React.Children.toArray(children?.props?.children).filter(Boolean);
  const mappedChildren = filteredChildren.map((child, index) => {
    return (<div className="rounded-lg overflow-hidden mb-8" key={`key-prop-${child.type}-${index}`}>
      <Card {...child.props}>
        {React.cloneElement(child)}
      </Card>
    </div>)
  });
  return (<div className="masonry px-16 py-8">
    {mappedChildren}
  </div>)
}

export default Grid;