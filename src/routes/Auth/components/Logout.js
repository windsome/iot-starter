import React, { Component, PropTypes } from 'react'
import classes from './List.scss'

export class DeviceList extends Component {
/*
    componentWillMount () {
        console.log ("componentWillMount");
    }
    componentWillReceiveProps (nextProps) {
        console.log ("componentWillReceiveProps");
    }
    shouldComponentUpdate (nextProps, nextState) {
        console.log ("shouldComponentUpdate");
        return true;
    }
    componentWillUpdate (nextProps, nextState) {
        console.log ("componentWillUpdate");
    }
    componentDidUpdate () {
        console.log ("componentDidUpdate");
    }
    componentWillUnmount () {
        console.log ("componentWillUnmount");
    }
*/
    componentDidMount () {
        console.log ("componentDidMount");
        this.props.fetchDevices && this.props.fetchDevices (0, 10);
    }

    render () {
        var props = this.props;
        console.log ("Auth/Logout",this.props);
        return (
<div>
  <div>
    <h2 className={classes.zenHeader}>
      {props.zen ? props.zen.value : ''}
    </h2>
    <button className='btn btn-default' onClick={props.fetchZen}>
        { 'Fetch a wisdom: ' } { props.signpkg?JSON.stringify(props.signpkg):'' }
    </button>
    {' '}
    <button className='btn btn-default' onClick={props.saveCurrentZen}>
        Save
    </button>
  </div>
  {props.saved.length
   ? <div className={classes.savedWisdoms}>
       <h3>Saved wisdoms</h3>
       <ul>
         {props.saved.map(zen=>
           <li key={zen.id}> {zen.value} </li>
         )}
       </ul>
     </div>
   : null
  }
</div>
        );
    }
}

DeviceList.propTypes = {
    zen:React.PropTypes.object,
    saved: React.PropTypes.array.isRequired,
    fetchZen: React.PropTypes.func.isRequired,
    saveCurrentZen: React.PropTypes.func.isRequired,
    signpkg:React.PropTypes.object
}
