import { useParams } from 'react-router-dom';
import ChatBox from '../components/ChatBox';

const GroupDetail = () => {
    const { groupId } = useParams();

    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-4">Group Chat</h1>
            <ChatBox groupId={groupId} />
        </div>
    );
};

export default GroupDetail;
