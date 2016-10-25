import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import classes from './List.scss'

export class LockList extends Component {
    componentDidMount () {
        console.log ("componentDidMount");
        this.props.adminFetchLocks && this.props.adminFetchLocks (0);
    }

    render () {
        const { dbLocks, adminFetchLocks, current } = this.props;
        return (
<div>
  <div>
    <button className='btn btn-default' onClick={adminFetchLocks.bind(undefined, 1)}>
      { ' Fetch Locks: ' } { current && (current.length+'') }
    </button>
    {' '}
  </div>
  {current && current.length > 0
   ? <div className={classes.savedWisdoms}>
       <h3>Lock List</h3>
       <ul>
         {current.map(lock=>
           <li className='row' key={dbLocks[lock].id}>
             <div className='col-sm-6 col-lg-6'>
               <Link to={'/iot/admin/lock/'+dbLocks[lock].id} activeClassName={classes.activeRoute}>{dbLocks[lock].id}</Link>
             </div> 
             <div className='col-sm-6 col-lg-6'>{dbLocks[lock].info} </div>
           </li>
         )}
       </ul>
     </div>
   : null
  }
</div>
        );
    }
}

LockList.propTypes = {
    dbLocks: React.PropTypes.object,
    current: React.PropTypes.array,
    adminFetchLocks: React.PropTypes.func.isRequired
}
