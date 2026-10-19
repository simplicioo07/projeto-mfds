import type { Project } from "../types";
import { mockProjects } from "../data/mockData";

export interface StoredProject extends Project {
  archived: boolean;
}

const STORAGE_KEY = "mfds-projects";

function createProjectId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `project-${crypto.randomUUID()}`;
  }

  return `project-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function getInitialProjects(): StoredProject[] {
  return mockProjects.map((project) => ({
    ...project,
    archived: false,
  }));
}

function readProjects(): StoredProject[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    const initialProjects = getInitialProjects();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialProjects),
    );

    return initialProjects;
  }

  try {
    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return getInitialProjects();
    }

    return parsed;
  } catch {
    return getInitialProjects();
  }
}

function writeProjects(projects: StoredProject[]): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(projects),
  );
}

export function getProjects(): StoredProject[] {
  return readProjects();
}

export function createProject(
  name: string,
  description: string,
): StoredProject {
  const projects = readProjects();

  const newProject: StoredProject = {
    id: createProjectId(),
    name: name.trim(),
    description: description.trim(),
    status: "Em andamento",
    pendingTasks: 0,
    progress: 0,
    archived: false,
  };

  const updatedProjects = [
    newProject,
    ...projects,
  ];

  writeProjects(updatedProjects);

  return newProject;
}

export function updateProject(
  id: string,
  name: string,
  description: string,
): StoredProject | null {
  const projects = readProjects();

  const projectIndex = projects.findIndex(
    (project) => project.id === id,
  );

  if (projectIndex === -1) {
    return null;
  }

  const updatedProject: StoredProject = {
    ...projects[projectIndex],
    name: name.trim(),
    description: description.trim(),
  };

  const updatedProjects = [...projects];

  updatedProjects[projectIndex] = updatedProject;

  writeProjects(updatedProjects);

  return updatedProject;
}

export function archiveProject(
  id: string,
): StoredProject | null {
  const projects = readProjects();

  const projectIndex = projects.findIndex(
    (project) => project.id === id,
  );

  if (projectIndex === -1) {
    return null;
  }

  const updatedProject: StoredProject = {
    ...projects[projectIndex],
    archived: true,
  };

  const updatedProjects = [...projects];

  updatedProjects[projectIndex] = updatedProject;

  writeProjects(updatedProjects);

  return updatedProject;
}

export function restoreProject(
  id: string,
): StoredProject | null {
  const projects = readProjects();

  const projectIndex = projects.findIndex(
    (project) => project.id === id,
  );

  if (projectIndex === -1) {
    return null;
  }

  const updatedProject: StoredProject = {
    ...projects[projectIndex],
    archived: false,
  };

  const updatedProjects = [...projects];

  updatedProjects[projectIndex] = updatedProject;

  writeProjects(updatedProjects);

  return updatedProject;
}

export function deleteProject(id: string): boolean {
  const projects = readProjects();

  const projectExists = projects.some(
    (project) => project.id === id,
  );

  if (!projectExists) {
    return false;
  }

  const updatedProjects = projects.filter(
    (project) => project.id !== id,
  );

  writeProjects(updatedProjects);

  return true;
}