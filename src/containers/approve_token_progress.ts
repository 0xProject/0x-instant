import { connect } from 'react-redux';
import { ApproveTokenProgress } from '../components/approve_token_progress';


import { State } from '../redux/reducer';
import { ApproveState } from '../types';

interface ConnectedState {
    approveState: ApproveState;
}
const mapStateToProps = (state: State, _ownProps: {}): ConnectedState => ({
    approveState: state.approveState,
});
export const ApproveTokenProgressContainer = connect(mapStateToProps)(ApproveTokenProgress);

