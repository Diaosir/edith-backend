import React, { useState } from "react";
import ReactDOM from "react-dom";
import './scss/index.scss';
import sum from './utils/sum'
class App extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
      console.log(sum(1, 2))
    }
    render() {
        return (
            <div className="App">
              111
            </div>
          );
    }
}

ReactDOM.render(<App></App>, document.getElementById('app'))
