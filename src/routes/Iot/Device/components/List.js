import React, { Component, PropTypes } from 'react'
import classes from './List.scss'

export class DeviceList extends Component {
    componentDidMount () {
        console.log ("componentDidMount");
        this.props.fetchDevices && this.props.fetchDevices (0, 10);
    }

    render () {
        var props = this.props;
        console.log ("Iot/Device/component/List", this.props);

        var { devices } = this.props;
        var devicelist = devices && devices.device_list;
        

        return (
<div>
  <div>
    <button className='btn btn-default' onClick={props.fetchDevices.bind(undefined, 0, 10)}>
        { 'Fetch Devices: ' } { devicelist && (devicelist.length+'') }
    </button>
    {' '}
    <button className='btn btn-default' onClick={props.saveCurrentZen}>
        Save
    </button>
  </div>
  {devicelist && devicelist.length
   ? <div className={classes.savedWisdoms}>
       <h3>Device List</h3>
       <ul>
         {devicelist.map(device=>
           <li key={device.device_id}> {device.device_type} - {device.device_id} </li>
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
