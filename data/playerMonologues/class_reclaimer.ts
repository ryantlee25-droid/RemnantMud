// ============================================================
// class_reclaimer.ts — Reclaimer monologue pool
// Convoy: remnant-narrative-0329 | Rider F
//
// Voice: data-driven, sees the world as information.
// Systems failing: log it, diagnose it, fix it.
// Emotions are subroutines that keep interrupting the main process.
// ============================================================

import type { MonologuePool } from '@/types/convoy-contracts'

export const RECLAIMER_POOLS: MonologuePool[] = [

  // -------------------------------------------------------
  // low_hp — systems failing, core compromised
  // -------------------------------------------------------
  {
    class: 'reclaimer',
    personalLoss: 'child',
    trigger: 'low_hp',
    lines: [
      `*"Systems failing. Core functionality compromised. You need maintenance."*`,
      `*"You run diagnostics on your current state. The output is bad. Run the repair subroutine anyway."*`,
      `*"Critical failure is not an option. Reconfigure. Continue."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'partner',
    trigger: 'low_hp',
    lines: [
      `*"Systems failing. Core functionality compromised. You need maintenance."*`,
      `*"The error log says: running below threshold. Override the threshold. Keep running."*`,
      `*"You've salvaged systems in worse condition than this. Salvage yourself."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'community',
    trigger: 'low_hp',
    lines: [
      `*"Systems failing. Core functionality compromised. The mission requires maintenance. Proceed."*`,
      `*"You've kept broken machines running past their expected lifespan. You know how this works."*`,
      `*"Critical warning. Logged. Addressed. Moving."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'identity',
    trigger: 'low_hp',
    lines: [
      `*"Systems failing. Core functionality compromised. Core identity: corrupted. Keep going anyway."*`,
      `*"You don't know what you're rebuilding toward. You know how to rebuild. Start there."*`,
      `*"Critical failure is not an option. Reconfigure whatever is left."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'promise',
    trigger: 'low_hp',
    lines: [
      `*"Systems failing. The promise is the primary process. Protect the primary process."*`,
      `*"You've run machines past their fail-safe limits. You're a machine. Run past yours."*`,
      `*"Critical warning: process incomplete. Maintenance mandatory. The subroutine that holds the promise does not stop."*`,
    ],
  },

  // -------------------------------------------------------
  // post_combat — cataloguing, data processing
  // -------------------------------------------------------
  {
    class: 'reclaimer',
    personalLoss: 'child',
    trigger: 'post_combat',
    lines: [
      `*"Encounter closed. Bug report: you took more damage than the threat profile suggested. Update the threat model."*`,
      `*"Post-action log: efficiency suboptimal. Acceptable. Optimize next iteration."*`,
      `*"You survived. Write the entry. Move to the next process."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'partner',
    trigger: 'post_combat',
    lines: [
      `*"Encounter closed. The damage log is readable. You read it and stop reading."*`,
      `*"Post-action: survivable. The subroutine that wants to keep processing can wait."*`,
      `*"You survived. The system confirms it. That used to feel like less data than it does now."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'community',
    trigger: 'post_combat',
    lines: [
      `*"Encounter closed. Log the resource expenditure. Compile the efficiency numbers."*`,
      `*"The encounter data is useful. Archive it. Reference it next time."*`,
      `*"Post-action: operational integrity maintained. The network that used to process this with you is offline. You process alone."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'identity',
    trigger: 'post_combat',
    lines: [
      `*"Encounter closed. You log the instincts that fired. Whatever you were before, they trained you for exactly this."*`,
      `*"Post-action analysis: the response sequence was native. The architecture is intact even where the documentation isn't."*`,
      `*"The encounter log is consistent with prior entries. A pattern is compiling."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'promise',
    trigger: 'post_combat',
    lines: [
      `*"Encounter closed. It was a subroutine interruption. Log it, close the thread, return to primary process."*`,
      `*"Post-action: operational. The promise is the main loop. Everything else is a subroutine. Subroutine closed."*`,
      `*"Resource cost: noted. Primary process status: running. Net result: continue."*`,
    ],
  },

  // -------------------------------------------------------
  // in_danger — threat assessment as diagnostic
  // -------------------------------------------------------
  {
    class: 'reclaimer',
    personalLoss: 'child',
    trigger: 'in_danger',
    lines: [
      `*"System failure in progress. Locate the breach. Isolate it."*`,
      `*"Error state detected. Run the diagnostic before the system crashes completely."*`,
      `*"The environment is throwing errors. Read the log before it overwrites."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'partner',
    trigger: 'in_danger',
    lines: [
      `*"Anomaly in system state. Variables elevated. Initiating error-handling subroutine."*`,
      `*"Something in the architecture is failing. You read failing systems. This one is in cascade."*`,
      `*"Critical error flagged. You've learned not to dismiss critical errors."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'community',
    trigger: 'in_danger',
    lines: [
      `*"System failure in progress. Locate the breach. Isolate it."*`,
      `*"The architecture broke. You read broken architectures. This one needs immediate intervention."*`,
      `*"Error state: confirmed. Subroutine: threat response. Execute."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'identity',
    trigger: 'in_danger',
    lines: [
      `*"Error state detected. Your threat-response subroutine fired before you authorized it. Trust the subroutine."*`,
      `*"The environment is throwing errors. You've been reading error states for longer than you remember."*`,
      `*"Danger. You respond. Whatever the core process is, the threat-handling module is intact."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'promise',
    trigger: 'in_danger',
    lines: [
      `*"Error state detected. Calculate: engage or reroute. The promise is the primary process. Protect it."*`,
      `*"Danger. The primary process requires operational status. Error-handling: keep the system running."*`,
      `*"System error. Proceed carefully. The main loop does not terminate here."*`,
    ],
  },

  // -------------------------------------------------------
  // examining_loss_item — the data you can't process
  // -------------------------------------------------------
  {
    class: 'reclaimer',
    personalLoss: 'child',
    trigger: 'examining_loss_item',
    lines: [
      `*"The input was there all along. You just couldn't parse the format in time."*`,
      `*"You run every diagnostic subroutine you have. The analysis returns: insufficient. That's a new error."*`,
      `*"Some inputs are not processable. You've been running this one through the parser for a long time. No output."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'partner',
    trigger: 'examining_loss_item',
    lines: [
      `*"The error was in the interpretation, not the input. You read it correctly. The conclusion was wrong."*`,
      `*"You hold it and the processing load spikes and you don't want to resolve the exception."*`,
      `*"Some things don't compile into clean output. This is one of them. That's new for you."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'community',
    trigger: 'examining_loss_item',
    lines: [
      `*"The failure was logged. The failure was preventable. The log is very thorough."*`,
      `*"You hold it. You run the repair subroutine. This one has no patch. That's the problem."*`,
      `*"The input was there all along. You kept finding reasons the error output was wrong. It wasn't wrong."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'identity',
    trigger: 'examining_loss_item',
    lines: [
      `*"The input was there all along. You just couldn't read the encoding."*`,
      `*"Another fragment from the archive. You're reconstructing the core from backup files. It's slow work."*`,
      `*"Something in the base system recognizes this. The recognition fires without a matching log entry. Unresolved."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'promise',
    trigger: 'examining_loss_item',
    lines: [
      `*"The data confirms: this is the source process. You didn't need confirmation. You have it now."*`,
      `*"You log the object and what it represents. The primary process entry is current."*`,
      `*"Motivation: compiled. Confirmed. Priority flag: unchanged. The promise is the root process."*`,
    ],
  },

  // -------------------------------------------------------
  // safe_rest — processing time, maintenance window
  // -------------------------------------------------------
  {
    class: 'reclaimer',
    personalLoss: 'child',
    trigger: 'safe_rest',
    lines: [
      `*"The quiet used to have more in it. The archive is smaller now."*`,
      `*"Maintenance window. You run diagnostics. You note the subsystems that need attention."*`,
      `*"Safe. You allocate the downtime correctly. Rest is a system requirement."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'partner',
    trigger: 'safe_rest',
    lines: [
      `*"The quiet is good for processing. The exception threads are louder when nothing else is running."*`,
      `*"Maintenance window. You let the system run its own error-handling for a while."*`,
      `*"You used to have someone to debug with. You debug alone now. It's slower."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'community',
    trigger: 'safe_rest',
    lines: [
      `*"Maintenance window. The processing queue is long. You work through it in order."*`,
      `*"You run the distributed-system recovery protocol. There are no other nodes online. Solo recovery is slower."*`,
      `*"Safe. Use the downtime. There will be less downtime later."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'identity',
    trigger: 'safe_rest',
    lines: [
      `*"Maintenance window. The core process is unknown. You maintain the subsystems you can identify."*`,
      `*"You don't know what you're maintaining. You maintain it anyway. Something is rebuilding in the background."*`,
      `*"Processing. A background thread is reconstructing something. You don't interrupt background threads."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'promise',
    trigger: 'safe_rest',
    lines: [
      `*"Maintenance window. The primary process is queued. System recovery runs first."*`,
      `*"The quiet is good for processing. You compile the mission variables. You sleep."*`,
      `*"Rest is a resource. You allocate it to keep the primary process running."*`,
    ],
  },

  // -------------------------------------------------------
  // act_transition — system parameters updated
  // -------------------------------------------------------
  {
    class: 'reclaimer',
    personalLoss: 'child',
    trigger: 'act_transition',
    lines: [
      `*"Parameters updated. You rebuild the model with the new inputs."*`,
      `*"The system changed. You read the new architecture. You adapt the process."*`,
      `*"New error state. You've debugged harder systems than this. Find the root cause."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'partner',
    trigger: 'act_transition',
    lines: [
      `*"System update. New constraints, new variables. You recalculate the model."*`,
      `*"The architecture changed. You reverse-engineer the new structure. You've done this before."*`,
      `*"New operational parameters. The loss subroutine logs it and returns control. Continue."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'community',
    trigger: 'act_transition',
    lines: [
      `*"Parameters shifted. You rebuild the model. The new model is a degraded version. You run it anyway."*`,
      `*"System update. You recompile. The network that used to share the processing load is offline — you carry it alone."*`,
      `*"The environment updated. You patch the model. The primary process continues."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'identity',
    trigger: 'act_transition',
    lines: [
      `*"New inputs available. The model of yourself and the environment both need a rebuild."*`,
      `*"Parameters changed. You adapt. It's apparently a core subroutine — it fires before you decide."*`,
      `*"System update. You don't know the original architecture. You build from the current state."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'promise',
    trigger: 'act_transition',
    lines: [
      `*"System changed. The primary process is constant. Recalculate the execution path."*`,
      `*"New constraints. Same endpoint. Solve for the new route."*`,
      `*"Architecture updated. The promise is hardcoded — it doesn't update with the environment. Recompile everything else around it."*`,
    ],
  },

  // -------------------------------------------------------
  // pressure_spike — anomaly detected
  // -------------------------------------------------------
  {
    class: 'reclaimer',
    personalLoss: 'child',
    trigger: 'pressure_spike',
    lines: [
      `*"Anomaly detected. The system state is degrading. Log it and respond before cascade failure."*`,
      `*"Something in the ambient architecture is wrong. Read the error log carefully."*`,
      `*"Exception thrown. The subroutine that handles this is active. Execute it."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'partner',
    trigger: 'pressure_spike',
    lines: [
      `*"System pressure increasing. The delta is negative. The trend terminates somewhere bad."*`,
      `*"Something changed in the operational environment. The old model no longer fits. Recompile."*`,
      `*"Unhandled exception. You've learned to handle unhandled exceptions. Work the error."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'community',
    trigger: 'pressure_spike',
    lines: [
      `*"Ambient threat index elevated. The system has been logging this pattern. Act on the log."*`,
      `*"The subroutine is signaling. You've learned not to suppress subroutine signals."*`,
      `*"Network error. Something external is interfering with normal operation. Isolate the source."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'identity',
    trigger: 'pressure_spike',
    lines: [
      `*"Anomaly detected. The threat-response subroutine flagged it before the primary process did. Trust the subroutine."*`,
      `*"The system broke from expected state. Something changed. Find the change before it propagates."*`,
      `*"Unresolved exception in current environment. The base system knows how to handle this even when you don't."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'promise',
    trigger: 'pressure_spike',
    lines: [
      `*"Elevated threat. The primary process timeline may need compression. Adjust the execution schedule."*`,
      `*"System error in current environment. Log it. Route around it. The main loop does not terminate."*`,
      `*"Exception thrown. The promise is the primary process. You do not let a subroutine interrupt the primary process."*`,
    ],
  },
]
