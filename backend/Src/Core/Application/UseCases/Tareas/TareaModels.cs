namespace Application.UseCases.Tareas;

// TODO: Define your request/response models here.
// Follow the pattern from Auth/Login/LoginModels.cs

// Examples:
// public record GetTareasPagedRequest(int ProyectoId, int Pagina, int TamanoPagina);
// public record TareaDto(int Id, string Titulo, ...);
// public record CreateTareaRequest(...);
// public record UpdateTareaRequest(...);
// public record ChangeEstadoTareaRequest(int TareaId, int EstadoId);

public record GetTareasPagedRequest(int ProyectoId, int Pagina, int TamanoPagina);

public record TareaDto(
    int Id,
    int ProyectoId,
    string ProyectoNombre,
    string Titulo,
    string? Descripcion,
    int PrioridadId,
    string PrioridadNombre,
    int EstadoId,
    string EstadoNombre,
    int? UsuarioAsignadoId,
    string? UsuarioAsignadoNombre,
    DateTime FechaLimite,
    DateTime FechaCreacion
);

public record CreateTareaRequest(
    int ProyectoId,
    string Titulo,
    string? Descripcion,
    int PrioridadId,
    int? EstadoId,
    int? UsuarioAsignadoId,
    DateTime FechaLimite
);

public record UpdateTareaRequest(
    int ProyectoId,
    string Titulo,
    string? Descripcion,
    int PrioridadId,
    int? EstadoId,
    int? UsuarioAsignadoId,
    DateTime FechaLimite
);

public record ChangeEstadoTareaRequest(int EstadoId);
