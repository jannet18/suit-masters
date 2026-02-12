import { Group } from "@/app/lib/types";
import CustomizationOptions from "../CustomizationOptions";

interface Props {
  groups: Group[];
  selectedOptions: Record<number, number>;
  setSelectedOptions: (opts: Record<number, number>) => void;
}

export default function FabricStep(props: Props) {
  const fabricGroups = props.groups.filter((g) => g.type === "fabric");

  const { groups, ...restProps } = props;
  // Pass the first fabric group, or handle the case when none exist
  if (fabricGroups[0]) {
    return <CustomizationOptions group={fabricGroups[0]} {...restProps} />;
  }
  return null;
}
