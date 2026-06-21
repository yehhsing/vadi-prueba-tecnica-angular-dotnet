using Application.Common.Exceptions;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;

namespace Application.UseCases.Tareas;

public interface ICreateTareaUseCase : IUseCase
{
    Task<int> Execute(CreateTareaRequest request);
}

public class CreateTareaUseCase : ICreateTareaUseCase
{
    private const int EstadoPendienteId = 1;

    private readonly ITareaRepository _tareaRepository;
    private readonly IProyectoRepository _proyectoRepository;

    public CreateTareaUseCase(
        ITareaRepository tareaRepository,
        IProyectoRepository proyectoRepository)
    {
        _tareaRepository = tareaRepository;
        _proyectoRepository = proyectoRepository;
    }

    public async Task<int> Execute(CreateTareaRequest request)
    {
        _ = await _proyectoRepository.GetByIdAsync(request.ProyectoId)
            ?? throw new NotFoundException("Proyecto no encontrado.");

        var tarea = new Tarea
        {
            ProyectoId = request.ProyectoId,
            Titulo = request.Titulo,
            Descripcion = request.Descripcion,
            PrioridadId = request.PrioridadId,
            EstadoId = EstadoPendienteId,
            UsuarioAsignadoId = request.UsuarioAsignadoId,
            FechaLimite = request.FechaLimite
        };

        return await _tareaRepository.CreateAsync(tarea);
    }
}
