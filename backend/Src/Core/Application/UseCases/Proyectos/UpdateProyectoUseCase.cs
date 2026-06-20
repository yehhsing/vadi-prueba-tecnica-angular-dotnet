using Application.Common.Exceptions;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.UseCases.Proyectos
{
    public interface IUpdateProyectoUseCase : IUseCase
    {
        Task Execute(int id, UpdateProyectoRequest request);
    }

    public class UpdateProyectoUseCase : IUpdateProyectoUseCase
    {
        private const int EstadoCompletadaId = 3;

        private readonly IProyectoRepository _repo;
        private readonly IMapper _mapper;

        public UpdateProyectoUseCase(IProyectoRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task Execute(int id, UpdateProyectoRequest request)
        {
            var proyectoActual = await _repo.GetByIdAsync(id)
                ?? throw new NotFoundException("Proyecto no encontrado.");

            if (request.FechaFin < request.FechaInicio)
                throw new BusinessException("La fecha fin debe ser mayor o igual a la fecha inicio.");

            if (request.EstadoId == EstadoCompletadaId)
            {
                var hasInvalidTasks = await _repo.HasTasksNotCompletedOrCanceledAsync(id);

                if (hasInvalidTasks)
                    throw new BusinessException("No se puede completar un proyecto con tareas pendientes o en progreso.");
            }

            var proyecto = _mapper.Map<Proyecto>(request);
            proyecto.Id = id;
            proyecto.CreadoPorId = proyectoActual.CreadoPorId;

            await _repo.UpdateAsync(proyecto);
        }
    }
}
