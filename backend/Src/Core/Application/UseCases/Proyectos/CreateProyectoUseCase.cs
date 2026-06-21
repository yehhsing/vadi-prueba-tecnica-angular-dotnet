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
    public interface ICreateProyectoUseCase : IUseCase
    {
        Task<int> Execute(CreateProyectoRequest request, int creadoPorId);
    }

    internal class CreateProyectoUseCase : ICreateProyectoUseCase
    {
        private readonly IProyectoRepository _repo;
        private readonly IMapper _mapper;

        public CreateProyectoUseCase(IProyectoRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<int> Execute(CreateProyectoRequest request, int creadoPorId)
        {
            if (request.FechaFin < request.FechaInicio)
                throw new BusinessException("La fecha fin debe ser mayor o igual a la fecha inicio.");

            var proyecto = _mapper.Map<Proyecto>(request);
            proyecto.CreadoPorId = creadoPorId;

            return await _repo.CreateAsync(proyecto);
        }
    }
}
