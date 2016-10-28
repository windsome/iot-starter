import React, { Component, PropTypes } from 'react'
import classes from './Lock.scss'
import QRCode from 'qrcode.react';

export class Lock extends Component {
    componentDidMount () {
        console.log ("componentDidMount");
        var { init, simulator, startHeartBeat, stopHeartBeat } = this.props;
        var id = simulator && simulator.config && simulator.config.id;
        init && init (id);
        startHeartBeat && startHeartBeat (id, 20000);
    }
    componentWillUnmount () {
        var { deinit, stopHeartBeat } = this.props;
        //stopHeartBeat && stopHeartBeat();
        deinit && deinit ();
    }
    render () {
        var { simulator, emit2Server, emitRegister } = this.props;
        var id = simulator && simulator.config && simulator.config.id;
        var qrcode = simulator && simulator.config && simulator.config.qrcode;
        var cache = simulator && simulator.cache && simulator.cache.slice(-20);
        cache && cache.reverse();
        return (
<div>
  <div>
    <h1>Function</h1>
    <div>
      <button type="button" className="btn btn-primary" onClick={ emitRegister }>{ "Register:"+id }</button>
      { ' ' }
      <button type="button" className="btn btn-primary" onClick={ emit2Server.bind(null, id, JSON.stringify({ cmd:"qrcode",id:id,scene_id:123,expire:600 }) ) }>Get Qrcode</button>
      { ' ' }
      <button type="button" className="btn btn-primary" onClick={ emit2Server.bind(null, id, JSON.stringify({ cmd:"qrcode",id:id,scene_id:123,expire:600 }) ) }>Get Qrcode</button>
    </div>
  </div>
  <div>
    <h1>Config</h1>
    <div className="row">
      <div className="col-sm-6 col-lg-6">
      { JSON.stringify(simulator.config) }
      </div>
      <div className="col-sm-6 col-lg-6">
      { qrcode 
        ? <QRCode value={qrcode} />
        : ' '
      }
      </div>
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
