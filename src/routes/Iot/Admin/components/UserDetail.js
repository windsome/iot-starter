import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import classes from './List.scss'

export class UserDetail extends Component {
    componentDidMount () {
        console.log ("componentDidMount");
        var userId = this.props.params.id;
        this.props.fetchLocks && this.props.fetchLocks (userId);
    }

    render () {
        var props = this.props;
        var userId = this.props.params.id;
        var dbLocks = this.props.dbLocks;
        var locks = this.props.lock[userId];

        return (
<div>
  <div>
    <button className='btn btn-default' onClick={props.fetchLocks.bind(undefined, userId)}>
        {userId} { ' Fetch Locks: ' } { locks && (locks.length+'') }
    </button>
    {' '}
  </div>
  {locks && locks.length > 0
   ? <div className={classes.savedWisdoms}>
       <h3>Lock List</h3>
       <ul>
         {locks.map(lock=>
           <li className='row' key={dbLocks[lock].id}>
             <div className='col-sm-6 col-lg-6'>
               <Link to={'/iot/admin/user/'+userId+'/lock/'+dbLocks[lock].id} activeClassName={classes.activeRoute}>{dbLocks[lock].id}</Link>
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

UserDetail.propTypes = {
    dbLocks: React.PropTypes.object,
    lock: React.PropTypes.object,
    fetchLocks: React.PropTypes.func.isRequired
}
