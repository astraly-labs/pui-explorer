
import { Card } from "~/ui/Card";
import { ButtonOrLink } from "~/ui/utils/ButtonOrLink";

export function PolymediaCard() {
	return (
		<Card bg="white/80" spacing="lg" height="full">
			<div className="flex h-full flex-col gap-4 overflow-hidden">

				<div className="md:text-heading4 text-heading6 text-steel-darker font-semibold">
					Pragma Devnet Explorer
				</div>

				<div className="break-words text-pBody font-semibold text-steel-dark">
					The original PUI Explorer
				</div>

			</div>
		</Card>
	);
}
