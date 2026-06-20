namespace Application.UseCases.Proyectos;

// TODO: Define your request/response models here.
// Follow the pattern from Auth/Login/LoginModels.cs

// Examples:
// public record GetProyectosPagedRequest(int Pagina, int TamanoPagina);
// public record ProyectoDto(int Id, string Nombre, ...);
// public record CreateProyectoRequest(...);
// public record UpdateProyectoRequest(...);

public record GetProyectosPagedRequest(int Pagina, int TamanoPagina);

public record ProyectoDto(
    int Id,
    string Nombre,
    string? Descripcion,
    DateTime FechaInicio,
    DateTime FechaFin,
    int EstadoId,
    string EstadoNombre,
    int CreadoPorId,
    string CreadoPorNombre,
    DateTime FechaCreacion
);

public record CreateProyectoRequest(
    string Nombre,
    string? Descripcion,
    DateTime FechaInicio,
    DateTime FechaFin,
    int EstadoId,
    int CreadoPorId
);

public record UpdateProyectoRequest(
    string Nombre,
    string? Descripcion,
    DateTime FechaInicio,
    DateTime FechaFin,
    int EstadoId
);
