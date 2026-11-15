import { useState } from 'react';
import { PageTitle } from '@/app/PageTitle';
import { AppBar } from '@/shared/ui/AppBar';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Dialog } from '@/shared/ui/Dialog';
import { Dropdown } from '@/shared/ui/Dropdown';
import { GameTile, TILE_COLOR_COUNT } from '@/shared/ui/GameTile';
import { IconButton } from '@/shared/ui/IconButton';
import { PlayerChip } from '@/shared/ui/PlayerChip';
import { SkipLink } from '@/shared/ui/SkipLink';
import { Spinner } from '@/shared/ui/Spinner';
import { EmptyState, ErrorState } from '@/shared/ui/StatePanel';
import { TextField } from '@/shared/ui/TextField';
import { Tooltip } from '@/shared/ui/Tooltip';
import { INTERACTION_STYLES } from '@/core/games';
import { ShowcaseNav } from './ShowcaseLayout';
import styles from './Showcase.module.css';

const COLOURS = [
  'bg',
  'surface',
  'surface-raised',
  'text',
  'text-muted',
  'border',
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'focus',
];

const TYPE_STEPS = ['display', '3xl', '2xl', 'xl', 'lg', 'base', 'sm'];

export function DesignSystemPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lastAction, setLastAction] = useState('None yet');

  return (
    <>
      <PageTitle title="Design system" />
      <SkipLink />
      <AppBar start={<ShowcaseNav />} />
      <main id="main" tabIndex={-1} className="page-main">
        <div className={`container ${styles.page}`}>
          <header className={styles.intro}>
            <h1>Design system</h1>
            <p>
              Every shared component and token, live. Resize the window or switch your device to
              dark or light mode to see them adapt. Documentation:{' '}
              <code>docs/DESIGN_SYSTEM.md</code>.
            </p>
          </header>

          <section className={styles.section} aria-labelledby="ds-colour">
            <h2 id="ds-colour">Colour</h2>
            <p>
              Semantic tokens. Each has a light and a dark value chosen by the device&apos;s colour
              scheme.
            </p>
            <ul className={styles.swatches}>
              {COLOURS.map((name) => (
                <li key={name} className={styles.swatch}>
                  <span
                    className={styles.swatchColor}
                    style={{ background: `var(--color-${name})` }}
                  />
                  <code>--color-{name}</code>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="ds-type">
            <h2 id="ds-type">Typography</h2>
            <p>
              Fluid sizes (rem + vw) that grow with the screen and still respect zoom and text-size
              settings.
            </p>
            <div className={styles.typeSample}>
              {TYPE_STEPS.map((step) => (
                <div key={step}>
                  <code>--text-{step}</code>
                  <span
                    style={{
                      fontSize: `var(--text-${step})`,
                      fontFamily:
                        step === 'base' || step === 'sm'
                          ? 'var(--font-body)'
                          : 'var(--font-display)',
                      fontWeight: step === 'base' || step === 'sm' ? 400 : 800,
                      lineHeight: 1.15,
                    }}
                  >
                    Truth or Dare
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="ds-buttons">
            <h2 id="ds-buttons">Buttons</h2>
            <p>
              All sizes keep a 44×44 px minimum touch target. Small only reduces padding and text.
            </p>
            <div className={styles.row}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
              <Button variant="primary" busy>
                Busy
              </Button>
            </div>
            <div className={styles.row} style={{ marginTop: 'var(--space-4)' }}>
              <Button variant="primary" size="sm" icon="plus">
                Small
              </Button>
              <Button variant="primary" iconEnd="arrow-right">
                Medium
              </Button>
              <Button variant="primary" size="lg" iconEnd="arrow-right">
                Large
              </Button>
              <IconButton icon="help" label="How to play" />
              <IconButton icon="refresh" label="Restart" variant="secondary" />
              <IconButton icon="close" label="Close" variant="secondary" size="sm" />
            </div>
          </section>

          <section className={styles.section} aria-labelledby="ds-badges">
            <h2 id="ds-badges">Badges and tiles</h2>
            <div className={styles.row}>
              <Badge icon="users">2+ players</Badge>
              <Badge tone="primary">New</Badge>
              <Badge tone="secondary">Everyone at once</Badge>
              <Badge tone="success" icon="check">
                Ready
              </Badge>
              <Badge tone="warning">Coming soon</Badge>
              <Badge tone="danger">Removed</Badge>
            </div>
            <div className={styles.row} style={{ marginTop: 'var(--space-4)' }}>
              {Array.from({ length: TILE_COLOR_COUNT }, (_, i) => (
                <GameTile
                  key={i}
                  index={i}
                  interaction={[INTERACTION_STYLES[i % INTERACTION_STYLES.length]!]}
                />
              ))}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="ds-forms">
            <h2 id="ds-forms">Inputs</h2>
            <div className={styles.grid}>
              <TextField label="Player name" placeholder="e.g. Priya" hint="Up to 24 characters." />
              <TextField
                label="Player name"
                defaultValue="Ravi"
                error="“Ravi” is already playing."
              />
            </div>
          </section>

          <section className={styles.section} aria-labelledby="ds-players">
            <h2 id="ds-players">Player chips</h2>
            <p>Presentational only. Games decide what “active” or the trailing slot mean.</p>
            <ul className={styles.playerStrip} aria-label="Example players">
              <li>
                <PlayerChip name="Priya" />
              </li>
              <li>
                <PlayerChip name="Ravi" position={2} active />
              </li>
              <li>
                <PlayerChip name="Sam" onRemove={() => setLastAction('Removed Sam (demo)')} />
              </li>
              <li>
                <PlayerChip
                  name="Anaïs-Marie Okonkwo-Lindqvist"
                  trailing={<Badge tone="primary">12</Badge>}
                />
              </li>
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="ds-cards">
            <h2 id="ds-cards">Cards</h2>
            <div className={styles.grid}>
              <Card>
                <h3>Default</h3>
                <p>Groups related content.</p>
              </Card>
              <Card variant="raised">
                <h3>Raised</h3>
                <p>For content that floats above the page.</p>
              </Card>
              <Card variant="outline">
                <h3>Outline</h3>
                <p>Quiet, for nesting sparingly.</p>
              </Card>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="ds-overlays">
            <h2 id="ds-overlays">Dialogs, menus and tooltips</h2>
            <p>
              Dialogs are bottom sheets on phones and centred on larger screens. Menus and tooltips
              work with touch and keyboard; nothing depends on hover. Last action:{' '}
              <strong>{lastAction}</strong>
            </p>
            <div className={styles.row}>
              <Button variant="secondary" onClick={() => setDialogOpen(true)}>
                Open dialog
              </Button>
              <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
                Open confirmation
              </Button>
              <Dropdown
                label="Example menu"
                align="start"
                trigger={{ text: 'Open menu', icon: 'more' }}
                items={[
                  {
                    id: 'rules',
                    label: 'How to play',
                    icon: 'help',
                    onSelect: () => setLastAction('How to play'),
                  },
                  {
                    id: 'restart',
                    label: 'Restart',
                    icon: 'refresh',
                    onSelect: () => setLastAction('Restart'),
                  },
                  {
                    id: 'exit',
                    label: 'Leave game',
                    icon: 'arrow-left',
                    tone: 'danger',
                    onSelect: () => setLastAction('Leave game'),
                  },
                ]}
              />
              <Tooltip content="Tooltips also appear on keyboard focus">
                <Button variant="ghost">Hover or focus me</Button>
              </Tooltip>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="ds-states">
            <h2 id="ds-states">Loading, empty and error states</h2>
            <div className={styles.grid}>
              <Card>
                <div className={styles.demoStage} role="status">
                  <Spinner />
                  <p>Loading…</p>
                </div>
              </Card>
              <Card>
                <EmptyState
                  title="No players yet"
                  headingLevel={3}
                  actions={
                    <Button variant="primary" icon="plus">
                      Add players
                    </Button>
                  }
                >
                  <p>Add everyone who is playing.</p>
                </EmptyState>
              </Card>
              <Card>
                <ErrorState
                  title="Couldn’t load the game"
                  headingLevel={3}
                  role={undefined}
                  actions={
                    <Button variant="secondary" icon="refresh">
                      Try again
                    </Button>
                  }
                >
                  <p>Check your connection and try again.</p>
                </ErrorState>
              </Card>
            </div>
          </section>
        </div>
      </main>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="How to play"
        description="An example dialog with scrolling content."
        footer={
          <Button variant="primary" onClick={() => setDialogOpen(false)}>
            Got it
          </Button>
        }
      >
        <ol>
          <li>Sit in a circle and choose who goes first.</li>
          <li>On your turn, pick truth or dare.</li>
          <li>Answer honestly, or complete the dare.</li>
          <li>Pass the device to the next person.</li>
        </ol>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Leave this game?"
        description="Your progress in this round will be lost."
        confirmLabel="Leave game"
        tone="danger"
        onCancel={() => {
          setConfirmOpen(false);
          setLastAction('Cancelled leaving');
        }}
        onConfirm={() => {
          setConfirmOpen(false);
          setLastAction('Confirmed leaving');
        }}
      />
    </>
  );
}
