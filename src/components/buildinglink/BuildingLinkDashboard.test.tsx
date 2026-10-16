import { describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockBuildingLinkClient } from "@/integrations/buildinglink/mock/client";
import { BuildingLinkProvider } from "@/integrations/buildinglink/provider";
import { useRosterVerification } from "@/integrations/buildinglink/hooks";
import { BuildingLinkDashboard } from "./BuildingLinkDashboard";

const NOW = new Date(2026, 9, 16, 13, 15, 0);

function renderDashboard(client = new MockBuildingLinkClient({ now: () => NOW, latency: false })) {
  const view = render(
    <BuildingLinkProvider client={client}>
      <BuildingLinkDashboard />
    </BuildingLinkProvider>,
  );
  return { client, ...view };
}

const panel = (name: RegExp) => screen.getByRole("region", { name });

describe("BuildingLinkDashboard", () => {
  it("renders the mode indicator and all five panels from fixtures", async () => {
    renderDashboard();
    expect(screen.getByText("Simulated")).toBeInTheDocument();
    expect(panel(/Every flow, every run/)).toBeInTheDocument();
    expect(panel(/One queue, two sources/)).toBeInTheDocument();
    expect(panel(/Logged today/)).toBeInTheDocument();
    expect(panel(/Sign-ups awaiting a match/)).toBeInTheDocument();
    expect(panel(/What mirrored, what did not/)).toBeInTheDocument();

    await waitFor(() =>
      expect(within(panel(/Every flow, every run/)).getAllByRole("listitem")).toHaveLength(5),
    );
    const sync = panel(/Every flow, every run/);
    expect(within(sync).getByText("Roster")).toBeInTheDocument();
    expect(within(sync).getByText("Service requests")).toBeInTheDocument();
    expect(within(sync).getAllByText(/Today, 5:02 AM/).length).toBeGreaterThan(0);
    expect(within(sync).getByText(/Kept the last good copy/)).toBeInTheDocument();
  });

  it("badges open requests by source and keeps the BuildingLink link a placeholder", async () => {
    renderDashboard();
    const requests = panel(/One queue, two sources/);
    await waitFor(() => expect(within(requests).getAllByText("BuildingLink")).toHaveLength(2));
    const buttons = within(requests).getAllByRole("button", { name: /Open in BuildingLink/ });
    expect(buttons.every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
    expect(within(requests).getAllByText("Logged by the desk").length).toBeGreaterThan(0);
  });

  it("lists only today's packages with provenance", async () => {
    renderDashboard();
    const log = panel(/Logged today/);
    await waitFor(() => expect(within(log).getAllByRole("listitem")).toHaveLength(3));
    expect(within(log).getAllByText("Logged by the desk")).toHaveLength(3);
    expect(within(log).queryByText("Residence 17F")).not.toBeInTheDocument();
  });

  it("shows the failed mirror item and clears it on retry", async () => {
    const user = userEvent.setup();
    renderDashboard();
    const mirror = panel(/What mirrored, what did not/);
    await waitFor(() =>
      expect(within(mirror).getByRole("button", { name: "Retry" })).toBeInTheDocument(),
    );
    expect(within(mirror).getByText(/did not download/)).toBeInTheDocument();
    await user.click(within(mirror).getByRole("button", { name: "Retry" }));
    await waitFor(() =>
      expect(within(mirror).queryByRole("button", { name: "Retry" })).not.toBeInTheDocument(),
    );
    expect(
      within(mirror).getByText("Window washing, east elevation, next week"),
    ).toBeInTheDocument();
  });

  it("lets staff approve a queued sign-up, changing demo state only", async () => {
    const user = userEvent.setup();
    const client = new MockBuildingLinkClient({ now: () => NOW, latency: false });

    function Queuer() {
      const { verify } = useRosterVerification();
      return (
        <button type="button" onClick={() => void verify("34B", "Nobody", "n@y.test")}>
          queue one
        </button>
      );
    }
    render(
      <BuildingLinkProvider client={client}>
        <Queuer />
        <BuildingLinkDashboard />
      </BuildingLinkProvider>,
    );
    await user.click(screen.getByRole("button", { name: "queue one" }));
    const queue = panel(/Sign-ups awaiting a match/);
    await waitFor(() => expect(within(queue).getByText("Nobody, 34B")).toBeInTheDocument());
    await user.click(within(queue).getByRole("button", { name: "Approve" }));
    expect(within(queue).queryByText("Nobody, 34B")).not.toBeInTheDocument();
    expect(within(queue).getByText(/Nobody, 34B \(approved\)/)).toBeInTheDocument();
  });

  it("flips every flow to failed and names the fallback when the outage switch is on", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() =>
      expect(within(panel(/Every flow, every run/)).getAllByRole("listitem")).toHaveLength(5),
    );
    await user.click(screen.getByRole("switch", { name: /Simulate a BuildingLink outage/ }));
    const sync = panel(/Every flow, every run/);
    await waitFor(() => expect(within(sync).getAllByText("failed")).toHaveLength(5));
    expect(
      within(sync).getByText(/emailed to the desk with a reference number/),
    ).toBeInTheDocument();
  });
});
