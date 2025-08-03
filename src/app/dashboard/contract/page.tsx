
import dynamic from 'next/dynamic';

const ContractInfo = dynamic(() => import('@/components/contract-info'), { 
    ssr: false 
});

export default function ContractPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <ContractInfo />
        </div>
    );
}
