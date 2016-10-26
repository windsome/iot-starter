import React, { Component, PropTypes } from 'react'
import classes from './Lock.scss'

export class Lock extends Component {
    componentDidMount () {
        console.log ("componentDidMount");
        var { init, simulator, startHeartBeat, stopHeartBeat } = this.props;
        var id = simulator && simulator.config && simulator.config.id;
        init && init (id);
        startHeartBeat && startHeartBeat (id, 5000);
    }
    componentWillUnmount () {
        var { deinit, stopHeartBeat } = this.props;
        deinit && deinit ();
        stopHeartBeat && stopHeartBeat();
    }
    guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }
    render () {
        var { simulator, emit2Server } = this.props;
        var id = simulator && simulator.config && simulator.config.id;
        var cache = simulator && simulator.cache && simulator.cache.slice(0);
        cache && cache.reverse();
        var uuid = this.guid();
        return (
<div>
  <div>
    <h1>Function</h1>
    <div>
      <button type="button" className="btn btn-primary" onClick={emit2Server.bind(null, id, JSON.stringify({ cmd:"register",id:uuid,mac:"00:22:68:11:e5:68" }) )}>{ "Register:"+uuid }</button>
      { ' ' }
      <button type="button" className="btn btn-primary" onClick={emit2Server.bind(null, id, JSON.stringify({ cmd:"qrcode",id:id,scene_id:123,expire:600 }) )}>Get Qrcode</button>
    </div>
  </div>
  <div>
    <h1>Config</h1>
    <div>
      { JSON.stringify(simulator.config) }
    </div>
  </div>
    <div className={classes.savedWisdoms}>
       <h3>Message List</h3>
  {cache && cache.length
     ?  <ul>
         {cache.map((item, index) =>
           <li key={index}> { item } </li>
         )}
       </ul>
   : null
  }
     </div>
</div>
        );
    }
}

Lock.propTypes = {
    simulator:React.PropTypes.object,
    init: React.PropTypes.func.isRequired,
    deinit: React.PropTypes.func.isRequired
}
