const React = require('react');
console.log(React)

class App extends React.Component {
    // state = {
    //     queue = []
    // }

    // handleAddToQueue = (obj) => {
    //     this.SetTate
    // }

    render() {
        const style = {
            backgroundColor: '#00ff00'
        }
        
    return ( 
        <div className="App">
           <img src="/public/jugglinglab/ss.gif"></img>
           <p style={style}></p>
        </div>
    );
    }
}

export default App;