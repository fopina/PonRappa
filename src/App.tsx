import { h } from 'preact';
import { Router, Route } from 'preact-iso';
import Player from './Player';
import Editor from './Editor';

function App() {
  return (
    <Router>
      <Route path="/" component={Player} />
      <Route path="/editor" component={Editor} />
    </Router>
  );
}

export default App;
