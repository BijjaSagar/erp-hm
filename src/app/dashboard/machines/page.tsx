import { getMachines, getBranches } from './actions';
import { MachineList } from './machine-list';

export default async function MachinesPage() {
    const [machinesResult, branchesResult] = await Promise.all([
        getMachines(),
        getBranches()
    ]);

    const machines = machinesResult.machines || [];
    const branches = branchesResult.branches || [];

    return (
        <div className="p-6">
            <MachineList machines={machines} branches={branches} />
        </div>
    );
}
