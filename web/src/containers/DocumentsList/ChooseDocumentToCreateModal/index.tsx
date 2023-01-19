import { LoadingOutlined } from '@ant-design/icons';
import { Button, Modal, ModalProps, Radio, Space, Spin } from 'antd';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { RenderRemoteData } from 'aidbox-react/lib/components/RenderRemoteData';
import { useService } from 'aidbox-react/lib/hooks/service';
import { extractBundleResources, getFHIRResources } from 'aidbox-react/lib/services/fhir';
import { mapSuccess } from 'aidbox-react/lib/services/service';

import { Patient, Questionnaire } from 'shared/src/contrib/aidbox';

interface Props extends ModalProps {
    patient: Patient;
}

function Spinner() {
    return <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />;
}

const questionnaireIds = 'gad-7,phq2phq9,allergies,physical-exam';

export const ChooseDocumentToCreateModal = (props: Props) => {
    const [questionnaireId, setQuestionnaireId] = useState();
    const location = useLocation();
    const navigate = useNavigate();
    const routeToOpen = `${location.pathname}/new/${questionnaireId}`;
    const [questionnairesResponse] = useService(async () =>
        mapSuccess(
            await getFHIRResources<Questionnaire>('Questionnaire', {
                id: questionnaireIds,
            }),
            (bundle) => extractBundleResources(bundle).Questionnaire,
        ),
    );

    return (
        <>
            <Modal
                title="Create document"
                footer={[
                    <Button key="back" onClick={(e: any) => props.onCancel?.(e)}>
                        Cancel
                    </Button>,
                    <Button
                        key="create"
                        disabled={!questionnaireId}
                        onClick={() => navigate(routeToOpen)}
                        type="primary"
                    >
                        Create
                    </Button>,
                ]}
                {...props}
            >
                <RenderRemoteData renderLoading={Spinner} remoteData={questionnairesResponse}>
                    {(questionnaires) => (
                        <>
                            <Radio.Group
                                onChange={(e) => setQuestionnaireId(e.target.value)}
                                value={questionnaireId}
                            >
                                <Space direction="vertical">
                                    {questionnaires.map((q) => (
                                        <Radio value={q.id} key={`create-document-${q.id}`}>
                                            {q.name}
                                        </Radio>
                                    ))}
                                </Space>
                            </Radio.Group>
                        </>
                    )}
                </RenderRemoteData>
            </Modal>
        </>
    );
};