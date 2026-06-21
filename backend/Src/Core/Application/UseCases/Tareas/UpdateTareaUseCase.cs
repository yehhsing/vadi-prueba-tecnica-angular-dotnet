using Application.Common.Exceptions;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;

namespace Application.UseCases.Tareas;

public interface IUpdateTareaUseCase : IUseCase
{
    Task Execute(int id, UpdateTareaRequest request);
}

public class UpdateTareaUseCase : IUpdateTareaUseCase
{
    private const int EstadoCompletadaId = 3;

    private readonly ITareaRepository _tareaRepository;
    private readonly IProyectoRepository _proyectoRepository;

    public UpdateTareaUseCase(
        ITareaRepository tareaRepository,
        IProyectoRepository proyectoRepository)
    {
        _tareaRepository = tareaRepository;
        _proyectoRepository = proyectoRepository;
    }

    public async Task Execute(int id, UpdateTareaRequest request)
    {
        var tareaActual = await _tareaRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Tarea no encontrada.");

        var proyecto = await _proyectoRepository.GetByIdAsync(request.ProyectoId)
            ?? throw new NotFoundException("Proyecto no encontrado.");

        var estadoFinalId = request.EstadoId ?? tareaActual.EstadoId;

        if (estadoFinalId == EstadoCompletadaId && EsProyectoCancelado(proyecto.EstadoNombre))
            throw new BusinessException("No se puede completar una tarea si su proyecto esta cancelado.");

        var tarea = new Tarea
        {
            Id = id,
            ProyectoId = request.ProyectoId,
            Titulo = request.Titulo,
            Descripcion = request.Descripcion,
            PrioridadId = request.PrioridadId,
            EstadoId = estadoFinalId,
            UsuarioAsignadoId = request.UsuarioAsignadoId,
            FechaLimite = request.FechaLimite
        };

        await _tareaRepository.UpdateAsync(tarea);
    }

    private static bool EsProyectoCancelado(string estadoNombre)
    {
        return string.Equals(estadoNombre, "Cancelada", StringComparison.OrdinalIgnoreCase);
    }
}
